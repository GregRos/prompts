import chokidar, { FSWatcher, type FSWatcherEventMap } from "chokidar";
import type { EventName } from "chokidar/handler.js";
import type { Stats } from "fs";
import { defer, fromEventPattern, merge, Observable } from "rxjs";
import { debounceTime, finalize, share } from "rxjs/operators";

// Narrow chokidar's EventName type to the events we expose downstream

// Discriminated union for change events consumers will receive
export type _ChangeEvent =
  | { type: "add"; path: string; stats?: Stats | null }
  | { type: "change"; path: string; stats?: Stats | null }
  | { type: "unlink"; path: string }
  | { type: "addDir"; path: string }
  | { type: "unlinkDir"; path: string }
  | { type: "error"; path: string; error: Error };

export type ChangeEventOf<T extends EventName> = Extract<
  _ChangeEvent,
  { type: T }
>;
// Generic helper to convert a chokidar event into an Observable stream
function fromWatcherEvent<Args extends any[], T>(
  watcher: FSWatcher,
  event: EventName,
  selector: (...args: Args) => T
): Observable<T> {
  return fromEventPattern<any>(
    (h) => watcher.on(event as EventName, h as any),
    (h) => watcher.off(event as EventName, h as any),
    (...args: any[]) => selector(...(args as Args))
  );
}

function getEventArgs$<K extends EventName, R>(
  watcher: FSWatcher,
  event: K,
  transform: (...args: FSWatcherEventMap[K]) => R
): Observable<R> {
  return fromEventPattern<any>(
    (h) => watcher.on(event as EventName, h as any),
    (h) => watcher.off(event as EventName, h as any),
    (...args: any[]) => transform(...(args as FSWatcherEventMap[K]))
  );
}

function getNormalEvents$(watcher: FSWatcher) {
  const normalEvents = [
    "add",
    "change",
    "unlink",
    "addDir",
    "unlinkDir",
  ] as const;
  return merge(
    ...normalEvents.map((event) =>
      getEventArgs$(
        watcher,
        event,
        (path: string, stats: Stats | undefined) => ({
          type: event,
          path,
          stats,
        })
      )
    )
  );
}

/**
 * Watch a directory and expose an rxjs Observable of change events.
 * - Uses chokidar under the hood
 * - Cleans up watcher on unsubscribe
 * - Debounces rapid bursts slightly to coalesce noisy writes
 */
export function watchDir(targetDir: string): Observable<_ChangeEvent> {
  return defer(() => {
    const watcher: FSWatcher = chokidar.watch(targetDir, {
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 },
      depth: 10,
    });

    const normal$ = getNormalEvents$(watcher);
    const error$ = fromWatcherEvent<[error: Error], _ChangeEvent>(
      watcher,
      "error",
      (error) => {
        throw error;
      }
    );

    // Merge all event streams
    const all$ = merge(normal$, error$).pipe(
      // small debounce to coalesce rapid successive writes
      debounceTime(500),
      // ensure consumers can share a single watcher instance
      share(),
      // close watcher when the last subscriber unsubscribes or stream completes/errors
      finalize(() => {
        try {
          void watcher.close();
        } catch {}
      })
    );

    return all$;
  });
}

export default watchDir;
