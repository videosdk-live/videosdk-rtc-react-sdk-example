import useResponsiveSize from "../../hooks/useResponsiveSize";
import {
  product1Image,
  product2Image,
  product3Image,
} from "../../static/images";

const ProductPart = ({ padding }) => {
  return (
    <div>
      <div style={{ margin: padding }} className="flex flex-col">
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

const BuyNowButtonPart = ({ padding }) => {
  return (
    <div
      className="flex"
      style={{
        paddingTop: padding,
        paddingLeft: padding,
        paddingRight: padding,
        paddingBottom: padding / 2,
      }}
    >
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
  const padding = useResponsiveSize({
    xl: 12,
    lg: 16,
    md: 8,
    sm: 6,
    xs: 4,
  });
  return (
    <div
      className="overflow-y-auto overflow-x-hidden"
      style={{ height: Height }}
    >
      <div className="flex flex-col justify-between flex-1 h-full">
        <ProductPart padding={padding} />
        <BuyNowButtonPart padding={padding} />
      </div>
    </div>
  );
};

export default ECommercePanel;
