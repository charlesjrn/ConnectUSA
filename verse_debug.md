# Daily Verse Not Showing on Dashboard

## Issue
The VerseOfTheDay component is imported and placed in the Dashboard, but it's not rendering on the page.

## Current Code Location
- Dashboard.tsx line 169-171: `<div className="mb-8"><VerseOfTheDay /></div>`
- Positioned after FeaturedTestimonies and before Share Testimony button

## Possible Causes
1. VerseOfTheDay component returns null if no verse data
2. tRPC query `trpc.verses.getToday.useQuery()` might be failing
3. No verses in database

## Next Steps
- Check if verses exist in database
- Check browser console for errors
- Verify verses.getToday endpoint is working
