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

  // Use state for opinions, passed down from parent or fetched earlier
  const [opinions, setOpinions] = useState<Opinion[]>([]);

  useEffect(() => {
    const productId = id;

    fetch(`/api/opinions/validate?productId=${productId}&userId=${auth.id}`)
      .then((response) => response.json())
      .then((data) => {
        setCanAdd(data.validation);
      })
      .catch((error) => console.error("Error validating opinion:", error));

    // Initial fetch to get existing opinions for the product
    fetch(`/api/opinions/${id}`)
      .then((response) => response.json())
      .then((data) => {
        // Preprocess the username to extract part before '@'
        const processedOpinions = data.map((opinion: Opinion) => ({
          ...opinion,
          username: opinion.username.split("@")[0], // Extract part before '@'
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
    e.preventDefault(); // Prevent page reload

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
          // Get the new opinion from the response (assuming it's returned)
          const newOpinionData = await response.json();

          // Preprocess the username to extract part before '@'
          const processedNewOpinion = {
            ...newOpinionData,
            username: newOpinionData.email.split("@")[0], // Extract part before '@'
          };

          // Update the opinions state with the new opinion added
          setOpinions((prevOpinions) => [...prevOpinions, processedNewOpinion]);

          // Optionally reset the input fields
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
          <UserOpinion opinion={opinion} />
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
