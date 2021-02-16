/** @internal */
export const enum CharacterCodes {
    maxAsciiCharacter = 0x7f,

    lineFeed = 0x0a, // \n
    carriageReturn = 0x0d, // \r
    lineSeparator = 0x2028,
    paragraphSeparator = 0x2029,
    nextLine = 0x0085,

    // Unicode 3.0 space characters
    space = 0x0020, // " "
    nonBreakingSpace = 0x00a0, //
    enQuad = 0x2000,
    zeroWidthSpace = 0x200b,
    narrowNoBreakSpace = 0x202f,
    ideographicSpace = 0x3000,
    mathematicalSpace = 0x205f,
    ogham = 0x1680,

    ampersand = 0x26, // &
    at = 0x40, // @
    bar = 0x7c, // |
    closeBrace = 0x7d, // }
    colon = 0x3a, // :
    dot = 0x2e, // .
    equals = 0x3d, // =
    greaterThan = 0x3e, // >
    exclamation = 0x21, // !
    hash = 0x23, // #
    minus = 0x2d, // -
    openBrace = 0x7b, // {
    percent = 0x25, // %
    plus = 0x2b, // +
    formFeed = 0x0c, // \f
    byteOrderMark = 0xfeff,
    tab = 0x09, // \t
    verticalTab = 0x0b, // \v
}
