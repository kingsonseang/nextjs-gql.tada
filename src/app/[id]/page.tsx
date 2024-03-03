import PokemeonView from "../components/PokemeonView";

interface Props {
  params: {
    id: string;
  };
  searchParams: {
    [key: string]: string;
  };
}

export default function Page(props: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start space-y-6 p-24">
      <h1>ID: {props.params.id}</h1>

      <PokemeonView id={props.params.id} />
    </main>
  );
}
