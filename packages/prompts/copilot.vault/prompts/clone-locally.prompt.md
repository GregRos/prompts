---
argument-hint: "{repo = xyz, dest = .ai}"
name: clone-locally
---
Clone #{input} locally into #{input:dest:.ai}/#{repo name}. 

If #{input:repo} does not specify an owner, assume it's GregRos.
If #{input:repo} does not specify a provider, assume it's GitHub.
If #{input:repo} does not make sense in this context, or is not given, immediately respond with an error.

![[act-immediately.prompt|_]]
![[error.prompt|_]]