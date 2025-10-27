import Image from "next/image";

const Banner = () => {
  return (
    <main>
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-7xl pt-16 sm:pt-20 pb-20 banner-image">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-navyblue sm:text-5xl  lg:text-7xl md:4px lh-96">
              Solve problem with an <br /> integrated solution.
            </h1>
            <p className="mt-6 text-lg leading-8 text-bluegray">
              Our ERP solution is designed to help you manage your business to
              stay focused on the goals and track <br /> engagement .
            </p>
          </div>

          <Image
            src={"/img/dashboard.jpg"}
            alt="banner-image"
            width={1200}
            height={598}
          />
        </div>
      </div>
    </main>
  );
};

export default Banner;
