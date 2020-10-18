import React, { useState } from 'react';

// Create order context
const OrderContext = React.createContext();

// Create a "Provider" component that will live at higher level to be injected to root

export function OrderProvider({ children }) {
  const [order, setOrder] = useState([]);
  return (
    <OrderContext.Provider value={[order, setOrder]}>
      {children}
    </OrderContext.Provider>
  );
}

export default OrderContext;
