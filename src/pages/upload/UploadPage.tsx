// import UploadATK from "./UploadATK";
// import UploadBanner from "./UploadBanner";
// import UploadBrosurFlyer from "./UploadBrosurFlyer";
// import UploadCoppyPrint from "./UploadCoppyPrint";
// import UploadNameCardId from "./UploadNameCardId";
// import UploadPackaging from "./UploadPackaging";
// import UploadPhotos from "./UploadPhotos";
// import UploadStickerLogo from "./UploadStickerLogo";
// import UploadUndangan from "./UploadUndangan";
// import UploadAdmins from "./UploadAdmins";
// import UploadAdminLogs from "./UploadAdminLogs";
import UploadPromo from "./UploadPromo";
// import UploadStatsSummary from "./UploadStats";

const UploadPage = () => {
  return (
    <div className="mt-16 p-8 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Sample Data Produk</h1>

      <p className="text-gray-600 mb-4">
        Gunakan tombol submit di masing-masing kategori untuk mengupload data
        JSON ke Firestore. Pastikan file JSON sudah tersedia di{" "}
        <code>public/data/products/</code>.
      </p>

      <div className="space-y-6">
        {/* <UploadATK /> */}
        {/* <UploadBanner /> */}
        {/* <UploadBrosurFlyer /> */}
        {/* <UploadCoppyPrint /> */}
        {/* <UploadNameCardId /> */}
        {/* <UploadPackaging /> */}
        {/* <UploadPhotos /> */}
        {/* <UploadStickerLogo /> */}
        {/* <UploadUndangan /> */}
        {/* <UploadAdmins /> */}
        {/* <UploadAdminLogs /> */}
        <UploadPromo />
        {/* <UploadStatsSummary /> */}
      </div>
    </div>
  );
};

export default UploadPage;
