// const MOMENT_FORMAT = 'MMMM Do, YYYY';
// const apiUrl = 'http://localhost:5000/getaround3/us-central1/api';
// this.offset = 0;
// this.num = 4;
// this.reviews = [];
//
// populateReviewsItem = (newReviews) => {
//
//   if (this.offset > 19 && newReviews.length) {
//     const children = $('#reviews-wrapper').children();
//     let i = 0;
//     while (i < 4 && newReviews[i]) {
//       children[i].remove();
//       i++;
//     }
//   }
//
//   if (newReviews && newReviews.length) {
//     const cards = newReviews.map(review =>
//       `
//       <div class="col-3 card-wrapper">
//         <div class="card">
//           <div class="card-body">
//             <div class="card-title d-flex">
//               <h5 class="col-9">
//                 ${review.name}
//                 <br />
//                 <small>
//                   ${moment(review.date).format(MOMENT_FORMAT)}
//                 </small>
//               </h5>
//
//               <div class="col-3" style="background-image: url(${review['persona-image'].url})" />
//             </div>
//             <div class="row stars-holder">
//               ${[...Array(4)].map((e, i) => '<i class="fas fa-star" />').join('')}
//             </div>
//             <p class="card-text">
//               ${review.comment}
//             </p>
//           </div>
//         </div>
//       <div>
//       `
//     )
//     $('#reviews-wrapper').append(cards)
//   }
// }
//
// const fetchItems = ({ num = 8, offset = 0 } = {}) => {
//   fetch(`${apiUrl}/collections/reviews?num=${num}&offset=${offset}`)
//   .then(res => res.json())
//   .then(data => {
//     if (data && data.items) {
//       this.reviews = this.reviews.concat(data.items);
//       populateReviewsItem(data.items);
//     }
//   })
//   .catch(console.error)
//   .catch(console.error);
// }
//
// const initData = () => {
//   fetchItems();
//   this.offset = 8;
// }
//
// const loadMore = () => {
//   this.offset = this.offset + 4;
//   fetchItems({ num: this.num, offset: this.offset });
// }
//
// initData();
// $("#load-more").on('click', loadMore);
