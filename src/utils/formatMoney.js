const formatter = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

// Intl.NumberFormat() is built-in to browser and also Node.js

export default function formatMoney(cents) {
  return formatter.format(cents / 100);
}
