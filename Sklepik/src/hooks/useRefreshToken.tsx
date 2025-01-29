import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const response = await fetch("/api/users/refresh", {
      credentials: "include",
    });
    const data = await response.json();
    setAuth((prev) => {
      console.log(JSON.stringify(prev));
      console.log(data.accessToken);
      return { ...prev, accessToken: data.accessToken };
    });
    return data.accessToken;
  };
  return refresh;
};

export default useRefreshToken;
