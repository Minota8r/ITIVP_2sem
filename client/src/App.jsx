import ListingList from './ListingList';

export default function App() {
  return (
    <>
      <header className="header">
        <h1>Доска объявлений</h1>
        <p>Объявления хранятся в localStorage браузера</p>
      </header>
      <ListingList />
    </>
  );
}
