import star from "../assets/star1.png";
import empty_star from "../assets/empty-star1.png";
import "./comp_styles/opinion.css";

declare global {
  interface Opinion {
    opinion_id: number;
    product_id: number;
    username: string;
    content: string;
    rating: number;
  }
}

function UserOpinion(props: { opinion: Opinion }) {
  const { username, content, rating } = props.opinion;

  return (
    <div id="opinionContainer">
      <div id="userRating">
        <h3>{username}</h3>
        {[...Array(rating)].map(() => (
          <img src={star}></img>
        ))}
        {[...Array(5 - rating)].map(() => (
          <img src={empty_star}></img>
        ))}
      </div>
      <p>{content}</p>
    </div>
  );
}

export { UserOpinion };
