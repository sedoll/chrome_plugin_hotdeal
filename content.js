const searchText = "example"; // 찾고 싶은 검색어

// 현재 페이지의 제목과 URL 검사
const url = window.location.href.toLowerCase();
const params = new URLSearchParams(new URL(url).search);

let title = "";
let loadingContainer; // 로딩 화면 컨테이너 변수

// 로딩 화면 표시
function showLoading() {
  // 로딩 화면이 이미 존재하면 추가하지 않음
  if (!loadingContainer) {
    loadingContainer = document.createElement("div");
    loadingContainer.style.position = "fixed";
    loadingContainer.style.top = "50%";
    loadingContainer.style.left = "90%";
    loadingContainer.style.transform = "translate(-50%, -50%)";
    loadingContainer.style.padding = "20px";
    loadingContainer.style.backgroundColor = "#fff";
    loadingContainer.style.border = "1px solid #ccc";
    loadingContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    loadingContainer.style.zIndex = "9999";
    loadingContainer.style.fontSize = "18px";
    loadingContainer.style.fontWeight = "bold";
    loadingContainer.textContent = "로딩 중...";
    document.body.appendChild(loadingContainer);
  }
}

// 로딩 화면 숨기기
function hideLoading() {
  if (loadingContainer) {
    document.body.removeChild(loadingContainer);
    loadingContainer = null;
  }
}

if (url.includes("gmarket") || url.includes("auction")) {
    let searchKeyword = "";
  // g마켓, 옥션
  const tag = document.querySelector("h1.itemtit");
  if (tag) {
    title = tag.textContent;
  }

  if (title) {
    // 상세페이지
    searchKeyword = title;
  } else {
    // 목록
    searchKeyword = params.get("keyword");
  }
  searchKeyword = searchKeyword.replace(/\s+/g, '');  // 모든 공백 제거
//   let searchUrl = `https://search.shopping.naver.com/search/all?query=${searchKeyword}`;
  let searchUrl = `https://search.danawa.com/dsearch.php?k1=${searchKeyword}&module=goods&act=dispMain`;
  console.log(searchUrl);
  crawling(searchUrl);
} else if (url.includes("coupang")) {
    let searchKeyword = "";
  // 쿠팡
  const tag = document.querySelector("h1.prod-buy-header__title");
  if (tag) {
    title = tag.textContent;
  }

  if (title) {
    // 상세페이지
    searchKeyword = title;
  } else {
    // 목록
    searchKeyword = params.get("q");
  }
  searchKeyword = searchKeyword.replace(/\s+/g, '');  // 모든 공백 제거
//   let searchUrl = `https://search.shopping.naver.com/search/all?query=${searchKeyword}`;
let searchUrl = `https://search.danawa.com/dsearch.php?k1=${searchKeyword}&module=goods&act=dispMain`;
  console.log(searchKeyword);
  console.log('쿠팡 :' + searchUrl);
  crawling(searchUrl);
} else if (url.includes("11st")) {
    let searchKeyword = "";
  // 11번가
  const tag = document.querySelector("h1.title");
  if (tag) {
    title = tag.textContent;
  }

  if (title) {
    searchKeyword = title;
  } else {
    const encoded = params.get("kwd");
    searchKeyword = decodeURIComponent(encoded);
  }
  searchKeyword = searchKeyword.replace(/\s+/g, '');  // 모든 공백 제거
  let searchUrl = `https://search.danawa.com/dsearch.php?k1=${searchKeyword}&module=goods&act=dispMain`;
  console.log(searchUrl);
  crawling(searchUrl);
}

async function crawling(url) {
    showLoading(); // 로딩 표시
    try {
        const response = await fetch(url);
        const html = await response.text();  // HTML을 텍스트로 반환
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const products = doc.querySelectorAll("div.prod_main_info");
        const productList = [];
        products.forEach((product) => {
            console.log(product.innerHTML);
            const titleElement = product.querySelector("p.prod_name > a");
            const priceElement = product.querySelector("a.click_log_product_standard_price_ > strong, p.price_sect > a > strong");
            const linkElement = product.querySelector("div.thumb_image > a");

            if (titleElement && priceElement && linkElement) {
                const title = titleElement.textContent.trim();
                const price = priceElement.textContent.trim();
                const link = linkElement.href;

                productList.push({ title, price, link });
            }
        });

        displayProducts(productList);
    } catch (error) {
        console.error("크롤링 중 오류 발생:", error);
    } finally {
        hideLoading(); // 로딩 숨기기
    }
}

// 상품 정보를 화면에 표시하는 함수
function displayProducts(productList) {
  // 컨테이너 생성
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "50%";
  container.style.right = "10px";
  container.style.width = "300px";
  container.style.maxHeight = "400px";
  container.style.overflowY = "auto";
  container.style.backgroundColor = "#fff";
  container.style.border = "1px solid #ccc";
  container.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  container.style.padding = "10px";
  container.style.zIndex = "9999";

  // 컨테이너에 상품 정보 추가
  productList.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.style.marginBottom = "10px";
    productDiv.style.borderBottom = "1px solid #333";

    const title = document.createElement("a");
    title.href = product.link;
    title.textContent = product.title;
    title.target = "_blank";
    title.style.display = "block";
    title.style.fontWeight = "bold";
    title.style.color = "#0078ff";
    title.style.textDecoration = "none";
    title.style.marginBottom = "5px";

    const price = document.createElement("div");
    price.textContent = `가격: ${product.price}`;
    price.style.color = "#333";

    productDiv.appendChild(title);
    productDiv.appendChild(price);
    container.appendChild(productDiv);
  });

  // 데이터가 없는 경우
  if (productList < 1) {
    const productDiv = document.createElement("div");
    productDiv.style.marginBottom = "10px";
    productDiv.style.borderBottom = "1px solid #333";
    const price = document.createElement("div");
    price.textContent = `데이터가 없습니다.`;
    price.style.color = "#333";
    productDiv.appendChild(price);
    container.appendChild(productDiv);
  }

  // 컨테이너를 페이지에 추가
  document.body.appendChild(container);
}
