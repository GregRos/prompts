import { anyChar, eof, string } from "parjs"
import { many, manyTill, or, qthen, stringify } from "parjs/combinators"

const pPercentComment = string("%%").pipe(
    qthen(anyChar().pipe(manyTill("%%"), stringify()))
)

export const pRemovePercentComments = anyChar()
    .pipe(manyTill(pPercentComment.pipe(or(eof()))), stringify())
    .pipe(many(100), stringify())
