export const PHOTOS = Array.from({length:11},(_,i)=>({
  id:`photo-${String(i+1).padStart(2,'0')}`,
  src:`/assets/photos/photo-${String(i+1).padStart(2,'0')}.jpg`
}));

// Photos used only inside the Page 6 "Swipe through us" card.
// Replace these files in public/assets/girlfriend-photos/ to change the photos.
export const GIRLFRIEND_PHOTOS = Array.from({length:11},(_,i)=>({
  id:`girlfriend-${String(i+1).padStart(2,'0')}`,
  src:`/assets/girlfriend-photos/girlfriend-${String(i+1).padStart(2,'0')}.jpg`
}));
