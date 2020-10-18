import { useContext, useState } from 'react';
import OrderContext from '../components/OrderContext';
import attachNamesAndPrices from './attachNamesAndPrices';
import formatMoney from './formatMoney';
import calculateOrderTotal from './orderTotal';

export default function usePizza({ pizzas, values }) {
  // create state to hold order
  // removed this line because we moved useState up to the provider.
  // const [order, setOrder] = useState([]);
  // Now we access both our state and our update functions via context.
  const [order, setOrder] = useContext(OrderContext);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // make a function to add things to order
  function addToOrder(orderedPizza) {
    setOrder([...order, orderedPizza]);
  }
  // make a function to remove things from the order
  function removeFromOrder(i) {
    setOrder([
      // everything before the item we want to remove
      ...order.slice(0, i),
      // everything after the item we want to remove
      ...order.slice(i + 1),
    ]);
  }

  // function to run when form is submitted
  async function submitOrder(e) {
    e.preventDefault();
    // console.log(e);
    setLoading(true);
    setError(null);
    // setMessage(null);

    // gather all info
    const body = {
      order: attachNamesAndPrices(order, pizzas),
      total: formatMoney(calculateOrderTotal(order, pizzas)),
      name: values.name,
      email: values.email,
      ggul: values.ggul,
    };

    // send this data to serverless function when they checkout.
    const res = await fetch(
      `${process.env.GATSBY_SERVERLESS_BASE}/placeOrder`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    const text = JSON.parse(await res.text());

    // check if everything worked,
    if (res.status >= 400 && res.status < 600) {
      setLoading(false); // turn off loading
      setError(text.message);
    } else {
      // console.log(res.status);
      setLoading(false);
      setMessage('Success! Please check your email for the receipt.');
    }
  }

  return {
    order,
    addToOrder,
    removeFromOrder,
    error,
    loading,
    message,
    submitOrder,
  };
}
