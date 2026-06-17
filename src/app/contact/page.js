import Footer from "../components/footer";
import Nav from "../components/nav";

export const metadata = {
  title: "Contact | zaneg.net",
};

export default function Contact() {
  return (
    <>
      <Nav />
      <main className="container-page min-h-screen py-16">
        <h1 className="text-3xl font-medium">Contact</h1>
        <p className="mt-8 text-lg text-muted">
          Email: <span className="text-foreground">zanekg123$gmail.com</span>
        </p>
        <p className="mt-2 text-sm text-muted">Replace $ with @.</p>
      </main>
      <Footer />
    </>
  );
}
