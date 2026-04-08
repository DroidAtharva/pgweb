export const getBackendData = async () => {
  const res = await fetch("http://backend_container:5000/api");
  return res.json();
};