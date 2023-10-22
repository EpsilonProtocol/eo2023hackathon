import ClipLoader from "react-spinners/HashLoader";

export default function Loader() {
  return (
    <ClipLoader
      color="#66aaff"
      loading={true}
      size={50}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  );
}
