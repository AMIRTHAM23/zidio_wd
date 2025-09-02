import { useParams } from "react-router-dom";

const FileView = () => {
  const { id } = useParams();
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">File Details</h2>
      <p>Viewing file with ID: {id}</p>
    </div>
  );
};

export default FileView;
