// The product page's SHAPE, in one place: the page, the gallery and the loading skeleton (`ProductDetailsSkeleton`) all use these, so the skeleton
// is exactly where the page will be and nothing jumps when it arrives. Change a number here, never in one of them.

// The page: centred, at most 80rem wide.
export const PRODUCT_PAGE = 'container mx-auto my-4 max-w-7xl md:my-6';

// The picture is a square, but never taller than the screen can show: on a laptop a 616 px square runs off the bottom with its thumbnails, and
// on a phone held sideways a full-width square is higher than the whole screen. The number to subtract is what is around it at the top of the
// page: the announcement bar (36 px), the header, the breadcrumb and the page's margin, and the thumbnails under it: 17rem; on a phone also the
// fixed buy bar and bottom navigation: 19rem. 16rem is the smallest it is drawn (12rem on a phone held sideways, `short:`, where there is hardly
// any height). A column narrower than that wins (`100%`), so a phone held upright, where the width is the limit, looks as before.
// From md the grid below makes the gallery's COLUMN exactly this wide, so the picture fills its column instead of sitting in the middle of a wider
// one: the numbers in PICTURE_CAP and PRODUCT_GRID must stay equal. The wide-screen rule is a media query, not `md:`, because Tailwind puts `md:`
// after `short:` and a 844 x 390 phone matches both. `vh`, not `dvh`, so an older browser understands it.
export const PICTURE_CAP = 'mx-auto w-full max-w-[clamp(16rem,calc(100vh_-_19rem),100%)] [@media(min-width:768px)_and_(min-height:501px)]:max-w-[clamp(16rem,calc(100vh_-_17rem),100%)] short:max-w-[clamp(12rem,calc(100vh_-_17rem),100%)]';

// One column on a phone. From md the picture's column is as wide as the picture can be (half the page, but not taller than the screen) and the
// details beside it at most 48rem, the pair centred: on a wide, short laptop screen a plain half-and-half left a small picture in the middle of a
// wide column with a gap on both sides. A phone held sideways is too short for a full-width picture above the details: two columns there too.
export const PRODUCT_GRID = 'grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,min(50%,max(16rem,calc(100vh_-_17rem))))_minmax(0,48rem)] md:justify-center md:gap-8 short:grid-cols-2';

// The gallery's column: from md it stays in view while the details scroll, on a screen tall enough to hold it (a taller gallery than the screen
// would hide its thumbnails behind the end of the column).
export const GALLERY_COLUMN = 'md:self-start [@media(min-height:860px)]:md:sticky [@media(min-height:860px)]:md:top-24';
