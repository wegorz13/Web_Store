import { useEffect, useState } from "react";
import planeIcon from "../assets/paper-plane (1).png";
import "./comp_styles/opinionform.css";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { UserOpinion } from "./opinion";

function OpinionForm(props: { id: number }) {
  const [canAddOpinion, setCanAdd] = useState(false);
  const [newOpinion, setNewOpinion] = useState("");
  const [rating, setRating] = useState<number>();
  const { auth } = useAuth();
  const accessToken = auth.accessToken;
  const id = props.id;
  const navigate = useNavigate();

  const [opinions, setOpinions] = useState<Opinion[]>([]);

  useEffect(() => {
    const productId = id;

    fetch(`/api/opinions/validate?productId=${productId}&userId=${auth.id}`)
      .then((response) => response.json())
      .then((data) => {
        setCanAdd(data.validation);
      })
      .catch((error) => console.error("Error validating opinion:", error));

    fetch(`/api/opinions/${id}`)
      .then((response) => response.json())
      .then((data) => {
        const processedOpinions = data.map((opinion: Opinion) => ({
          ...opinion,
          username: opinion.username.split("@")[0],
        }));
        setOpinions(processedOpinions);
      })
      .catch((error) => console.error("Error fetching opinions:", error));
  }, [id, auth.id]);

  useEffect(() => {
    const productId = id;

    fetch(`/api/opinions/validate?productId=${productId}&userId=${auth.id}`)
      .then((response) => response.json())
      .then((data) => {
        setCanAdd(data.validation);
      })
      .catch((error) => console.error("Error validating opinion:", error));
  }, [id, auth.id, opinions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newOpinion && rating) {
      try {
        const response = await fetch(`/api/opinions`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            userId: auth.id,
            productId: id,
            content: newOpinion,
            rating: rating,
          }),
        });

        if (response.ok) {
          const newOpinionData = await response.json();

          const processedNewOpinion = {
            ...newOpinionData,
            username: newOpinionData.email.split("@")[0],
          };

          setOpinions((prevOpinions) => [...prevOpinions, processedNewOpinion]);

          setNewOpinion("");
          setRating(5);
        }
      } catch (error) {
        console.error("Error submitting opinion:", error);
        navigate("/login");
      }
    } else {
      alert("Please provide both opinion and rating.");
    }
  };

  return (
    <div>
      <div className="opinionContainer">
        <h3>Opinions</h3>
        {opinions.map((opinion) => (
          <UserOpinion
            opinion={opinion}
            onDelete={(id) =>
              setOpinions(opinions.filter((op) => op.opinion_id !== id))
            }
          />
        ))}
        {canAddOpinion ? (
          <form className="formp" onSubmit={handleSubmit}>
            <input
              className="opinionText"
              type="text"
              placeholder="Your opinion and rating..."
              onChange={(e) => setNewOpinion(e.target.value)}
            ></input>
            <input
              className="ratingInput"
              type="number"
              min="1"
              max="5"
              onChange={(e) => setRating(Number(e.target.value))}
            ></input>
            <button className="addOpinionBtn" type="submit">
              <img src={planeIcon} alt="Submit" />
            </button>
          </form>
        ) : (
          <p>You must first purchase the product to add an opinion</p>
        )}
      </div>
    </div>
  );
}

export { OpinionForm };
