const fetchJSON = async (url, errorMessage = 'Request failed') => {
  const response = await fetch(url);
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message || errorMessage);
  }
  return response.json();
};

const handleError = (error, container) => {
  console.error(error);
  container.innerHTML += `<p>Error: ${error.message}</p>`;
};

const encodeName = (name) => encodeURIComponent(name.replace(/&/g, '%26').replace(/\+/g, '%2B').replace(/\./g, '%2E'));