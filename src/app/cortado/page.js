import Footer from "../components/footer";
import Nav from "../components/nav";
import CortadoLedger from "./cortado-ledger";
import PlacesMap from "./places-map";
import places from "../../content/cortado.json";
import styles from "./cortado.module.css";

export const metadata = {
  title: "Cortado Map | zgro.net",
  description: "My cortado notes from coffee shops around North Dallas. The espresso, the milk, and whether the internet works.",
  robots: { index: false, follow: true },
};

export default function CortadoPage() {
  return (
    <>
      <Nav />
      <main className={`container-wide ${styles.page}`}>
        <h1 className={styles.title}>Cortado map</h1>
        <CortadoLedger places={places} />
        <PlacesMap places={places} />
      </main>
      <Footer />
    </>
  );
}
