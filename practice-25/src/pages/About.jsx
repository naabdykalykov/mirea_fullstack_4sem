export default function About() {
  return (
    <main>
      <h1>О нас</h1>
      <p>
        Эта страница подгружается лениво через <code>React.lazy</code> и{' '}
        <code>Suspense</code> — её код вынесен в отдельный чанк и запрашивается
        только при переходе на маршрут <code>/about</code>.
      </p>
    </main>
  );
}
