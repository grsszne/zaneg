import Footer from "../components/footer";
import Nav from "../components/nav";

export const metadata = {
  title: "About | zaneg.net",
};

export default function About() {
  return (
    <>
      <Nav />
      <main className="container-page min-h-screen py-16">
        <h1 className="text-3xl font-medium">About</h1>
        <div className="mt-8 space-y-3 text-lg leading-8 text-muted">
          <p>Texas.</p>
          <p>Electrical engineering student.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
