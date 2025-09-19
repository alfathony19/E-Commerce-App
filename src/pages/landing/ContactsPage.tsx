// src/pages/ContactPage.tsx

const ContactPage = () => {
  return (
    <section id="contact" className="scroll-mt-16 bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Get in touch</h2>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Map */}
          <div className="col-span-1 w-full h-64 md:h-full">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3963.698336465148!2d107.78088757499317!3d-6.559711493433444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNsKwMzMnMzUuMCJTIDEwN8KwNDcnMDAuNSJF!5e0!3m2!1sid!2sid!4v1757215824309!5m2!1sid!2sid"
              width="100%"
              height="100%"
              className="rounded-lg shadow-md border"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>

          {/* Head office */}
          <div>
            <h3 className="text-lg font-semibold mb-2 right-5">Head office</h3>
            <p className="text-gray-600">
              Jl. Kapt Hanafiah Karanganyar{" "}
              <strong>Depan gate Perum BSK</strong> <br />Kp.Rawabadak Kec./Kab.Subang,
              Jawbarat
            </p>
            <p className="mt-3">
              <span className="font-medium">Phone: </span>
              <a
                href="https://wa.me/62895-2347-5609"
                className="!text-teal-600 hover:underline"
              >
                +62 895-2347-5609
              </a>
            </p>
            <p>
              <span className="font-medium">Email: </span>
              <a
                href="mailto:amarmandiriprinting@gmail.com"
                className="text-teal-600 hover:underline"
              >
                amarmandiriprinting@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
