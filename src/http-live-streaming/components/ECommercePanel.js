import {
  product1Image,
  product2Image,
  product3Image,
} from "../../static/images";

const ProductPart = () => {
  return (
    <div>
      <div className="flex flex-col xl:m-4 m-2">
        <div class="carousel">
          <div class="carousel-inner">
            <input
              class="carousel-open hidden"
              type="radio"
              id="carousel-1"
              name="carousel"
              aria-hidden="true"
              hidden=""
              checked="checked"
            />
            <div id="carousel-1" class="carousel-item ">
              <div className="flex flex-1 items-center justify-center w-full h-full rounded bg-white">
                <img src={product1Image} />
              </div>
              <div className="mt-5">
                <p className="text-base font-semibold text-white text-justify">
                  Men Regular Fit Solid Collar Casual Shirt
                </p>
                <p className="mt-2 text-base  font-extrabold text-green-150">
                  $10
                </p>
                <p className="mt-3 text-[#9A9FA5] text-xs text-justify">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries
                </p>
              </div>
            </div>
            <input
              class="carousel-open hidden"
              type="radio"
              id="carousel-2"
              name="carousel"
              aria-hidden="true"
              hidden=""
            />
            <div id="carousel-2" class="carousel-item">
              <div className="flex flex-1 items-center justify-center w-full h-full rounded bg-pink-250">
                <img src={product2Image} />
              </div>
              <div className="mt-5">
                <p className="text-base font-semibold text-white text-justify">
                  Humans - Men Oversized Tshirt
                </p>
                <p className="mt-2 text-base  font-extrabold text-green-150">
                  $15
                </p>
                <p className="mt-3 text-[#9A9FA5] text-xs text-justify">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries
                </p>
              </div>
            </div>
            <input
              class="carousel-open hidden"
              type="radio"
              id="carousel-3"
              name="carousel"
              aria-hidden="true"
              hidden=""
            />
            <div id="carousel-3" class="carousel-item">
              <div className="flex flex-1 items-center justify-center w-full h-full rounded bg-green-750">
                <img src={product3Image} />
              </div>
              <div className="mt-5">
                <p className="text-base font-semibold text-white text-justify">
                  Skream - Men Oversized Tshirt
                </p>
                <p className="mt-2 text-base  font-extrabold text-green-150">
                  $12
                </p>
                <p className="mt-3 text-[#9A9FA5] text-xs text-justify">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries
                </p>
              </div>
            </div>
            <label for="carousel-3" class="carousel-control prev control-1">
              ‹
            </label>
            <label for="carousel-2" class="carousel-control next control-1">
              ›
            </label>
            <label for="carousel-1" class="carousel-control prev control-2">
              ‹
            </label>
            <label for="carousel-3" class="carousel-control next control-2">
              ›
            </label>
            <label for="carousel-2" class="carousel-control prev control-3">
              ‹
            </label>
            <label for="carousel-1" class="carousel-control next control-3">
              ›
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const BuyNowButtonPart = () => {
  return (
    <div className="flex xl:pt-4 xl:pb-2 xl:pl-4 xl:pr-4 pt-2 pb-1 pl-2 pr-2 ">
      <button
        className="w-full  bg-purple-550 text-white p-2 rounded"
        onClick={() => {
          console.log("hii");
        }}
      >
        Buy Now
      </button>
    </div>
  );
};

const ECommercePanel = ({ panelHeight }) => {
  const Height = panelHeight;

  return (
    <div
      className="overflow-y-auto overflow-x-hidden"
      style={{ height: Height }}
    >
      <div className="flex flex-col justify-between flex-1 h-full">
        <ProductPart />
        <BuyNowButtonPart />
      </div>
    </div>
  );
};

export default ECommercePanel;
