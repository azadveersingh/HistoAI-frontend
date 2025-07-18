import React, { useEffect, useState } from "react";
import { fetchVisibleCollections } from "../../services/collectionServices";
import ComponentCard from "../common/ComponentCard";
import { Link } from "react-router-dom";

const CollectionList: React.FC = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const data = await fetchVisibleCollections();
        setCollections(data);
      } catch (err: any) {
        setError("Failed to fetch collections");
      }
    };
    loadCollections();
  }, []);

  return (
    <ComponentCard title="Collections">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="space-y-4">
        {collections.map((col) => (
          <li
            key={col._id}
            className="flex justify-between items-center border-b pb-2"
          >
            <span>{col.name}</span>
            <Link
              to={`/dashboard/collections/${col._id}`}
              className="text-blue-600 hover:underline text-sm"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
    </ComponentCard>
  );
};

export default CollectionList;
