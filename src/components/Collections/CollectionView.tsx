import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCollectionById } from "../../services/collectionServices";
import ComponentCard from "../common/ComponentCard";

const CollectionView: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCollection = async () => {
      try {
        const data = await fetchCollectionById(collectionId || "");
        setCollection(data.collection);
      } catch (err: any) {
        setError("Failed to load collection");
      }
    };
    if (collectionId) loadCollection();
  }, [collectionId]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!collection) return <p>Loading...</p>;

  return (
    <ComponentCard title={`Collection: ${collection.name}`}>
      <p><strong>Books:</strong> {collection.bookIds?.length || 0}</p>
      <p><strong>Created By:</strong> {collection.createdBy}</p>
      <p><strong>Project ID:</strong> {collection.projectId || "N/A"}</p>
    </ComponentCard>
  );
};

export default CollectionView;
