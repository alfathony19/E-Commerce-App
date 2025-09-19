import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../libs/firebase";

export const updateOrderStatus = async (
  orderId: string,
  newStatus: string,
  adminEmail: string
) => {
  const orderRef = doc(db, "orders", orderId);

  await updateDoc(orderRef, {
    status: newStatus,
    history: arrayUnion({
      status: newStatus,
      updatedBy: adminEmail,
      timestamp: serverTimestamp(),
    }),
  });
};
