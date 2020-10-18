const nodemailer = require('nodemailer');

function generateOrderEmail({ order, total }) {
  return `<div>
  <h2>Your Recent Order for ${total}</h2>
  <p>We will have your order ready in 20 minutes.</p>
  <ul>
    ${order
      .map(
        (item) => `<li>
      <img src="${item.thumbnail}" alt="${item.name}" />
      ${item.size} ${item.name} - ${item.price}
    </li>`
      )
      .join('')}
  </ul>
  <p>Your total is <strong>${total}</strong> due at pick up</p>
  <style>
      ul {
        list-style: none;
      }
  </style>
  </div>`;
}

// create transport for the mailer
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function wait(ms = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  // check if honeypot is filled
  if (body.ggul) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `ERR: 5266` }),
    };
  }
  // validate data coming in
  const requiredFields = ['email', 'name', 'order'];

  for (const field of requiredFields) {
    // console.log(`checking that ${field} is good`);
    if (!body[field]) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Oops, you are missing the ${field} field`,
        }),
      };
    }
  }

  // make sure orders are not empty
  if (!body.order.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Don't forget to add pizzas!`,
      }),
    };
  }

  // send the email
  const info = await transporter.sendMail({
    from: "Slick's Slices <slicks@example.com>",
    to: `${body.name} <${body.email}>, orders@example.com`,
    subject: 'New Order',
    html: generateOrderEmail({ order: body.order, total: body.total }),
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
};
