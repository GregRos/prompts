import { anyChar, string } from "parjs"
import { many, manyTill, qthen, stringify } from "parjs/combinators"

const pPercentComment = string("%%").pipe(qthen(anyChar().pipe(manyTill("%%"), stringify())))

export const pRemovePercentComments = anyChar()
    .pipe(manyTill(pPercentComment), stringify())
    .pipe(many(), stringify())
