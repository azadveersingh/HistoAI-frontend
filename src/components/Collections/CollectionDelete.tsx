import { deleteCollection } from "../../services/collectionServices";
import { useNavigate, useParams } from "react-router-dom";

export default function CollectionDelete() {
  const { collectionId } = useParams();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!collectionId) return;
    try {
      await deleteCollection(collectionId);
      alert("Collection deleted");
      navigate("/dashboard/collections");
    } catch (err) {
      alert("Failed to delete collection");
    }
  };

  return (
    <div>
      <p>Are you sure you want to delete this collection?</p>
      <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
        Confirm Delete
      </button>
    </div>
  );
}
