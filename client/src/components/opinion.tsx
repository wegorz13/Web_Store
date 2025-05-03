import star from "../assets/star1.png";
import empty_star from "../assets/empty-star1.png";
import "./comp_styles/opinion.css";
import useAuth from "../hooks/useAuth";

declare global {
  interface Opinion {
    opinion_id: number;
    product_id: number;
    username: string;
    user_id: number;
    content: string;
    rating: number;
  }
}

function UserOpinion(props: {
  opinion: Opinion;
  onDelete: (opinionId: number) => void;
}) {
  const { opinion_id, username, content, rating, user_id } = props.opinion;
  const { auth } = useAuth();
  const userRole = auth.role;
  const userId = auth.id;
  const accessToken = auth.accessToken;

  const deleteOpinion = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this opinion?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/opinions/${opinion_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete opinion");
      }

      props.onDelete(opinion_id);
    } catch (error) {
      console.error("Error deleting opinion:", error);
      alert("Failed to delete opinion.");
    }
  };

  return (
    <div id="opinionContainer">
      <div id="top">
        <div id="userRating">
          <h3>{username}</h3>
          {[...Array(rating)].map(() => (
            <img src={star}></img>
          ))}
          {[...Array(5 - rating)].map(() => (
            <img src={empty_star}></img>
          ))}
        </div>
        {userId == user_id || userRole == 1000 ? (
          <button className="deleteOpinionBtn" onClick={deleteOpinion}>
            X
          </button>
        ) : (
          <></>
        )}
      </div>
      <p>{content}</p>
    </div>
  );
}

export { UserOpinion };
