import { renderComponent } from 'brisa/server';

export default function CounterServer({
  initialValue = 0,
}: {
  initialValue: number;
}) {
  function increment(e: Event) {
    const value = Number((e.target as HTMLButtonElement).dataset.value);
    renderComponent({ element: <CounterServer initialValue={value + 1} /> });
  }

  function decrement(e: Event) {
    const value = Number((e.target as HTMLButtonElement).dataset.value);
    renderComponent({ element: <CounterServer initialValue={value - 1} /> });
  }

  return (
    <div class="counter">
      <div class="counter-container">
        <h2>Server counter</h2>
        <button
          data-value={initialValue}
          class="increment-button"
          onClick={increment}
        ></button>
        <div class="counter-value">{initialValue}</div>
        <button
          data-value={initialValue}
          class="decrement-button"
          onClick={decrement}
        ></button>
      </div>
    </div>
  );
}
