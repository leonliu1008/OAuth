async function fetchProduct() {
  try {
    // fetch return 一個promise
    const response = await fetch(
      "https://mdn.github.io/learning-area/javascript/apis/fetching-data/can-store/products.json"
    );
    let data = await response.json();
    console.log(data);
  } catch (e) {
    console.log(e);
  }
}

async function example() {
  // axios.get() return 一個promise
  // Axios Response 特別的Object
  let axiosResponseObj = await axios.get(
    "https://mdn.github.io/learning-area/javascript/apis/fetching-data/can-store/products.json"
  );
  console.log(axiosResponseObj.data);
}

fetchProduct();
example();
