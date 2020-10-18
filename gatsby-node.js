import path from 'path';
import fetch from 'isomorphic-fetch';

async function turnPizzasIntoPages({ graphql, actions }) {
  // 1. Get a template for this page
  const pizzaTemplate = path.resolve('./src/templates/Pizza.js');
  // 2. Query all pizzas
  const { data } = await graphql(`
    query {
      pizzas: allSanityPizza {
        nodes {
          name
          slug {
            current
          }
        }
      }
    }
  `);
  // console.log(data);
  // 3. Loop over each pizza and create page for each.
  data.pizzas.nodes.forEach((pizza) => {
    actions.createPage({
      // what is the URL for the new page?
      path: `pizza/${pizza.slug.current}`,
      component: pizzaTemplate,
      context: {
        slug: pizza.slug.current,
      },
    });
  });
}

async function turnToppingsIntoPages({ graphql, actions }) {
  // 1. Get the template
  const toppingTemplate = path.resolve('./src/pages/pizzas.js');
  // 2. Query all toppings
  const { data } = await graphql(`
    query {
      toppings: allSanityTopping {
        nodes {
          name
          id
        }
      }
    }
  `);
  // 3. Create page for that topping
  data.toppings.nodes.forEach((topping) =>
    actions.createPage({
      path: `topping/${topping.name}`,
      component: toppingTemplate,
      context: {
        topping: topping.name,
        // TODO Regex for topping
        toppingRegex: `/${topping.name}/i`,
      },
    })
  );
  // 4. Pass topping data to pizza.js
}

async function fetchBeersAndTurnIntoNodes({
  actions,
  createNodeId,
  createContentDigest,
}) {
  // 1. fetch list of beers
  const res = await fetch('https://sampleapis.com/beers/api/ale');
  const beers = await res.json();
  // console.log('🍻', beers);
  // 2. loop over each one
  for (const beer of beers) {
    // create node for each beer
    const nodeMeta = {
      id: createNodeId(`beer-${beer.name}`),
      parent: null,
      children: [],
      internal: {
        type: 'Beer',
        mediaType: 'application/json',
        contentDigest: createContentDigest(beer),
      },
    };
    actions.createNode({
      ...beer,
      ...nodeMeta,
    });
  }
  // 3. create a node for the beer
}

async function turnSlicemastersIntoPages({ graphql, actions }) {
  const slicemasterTemplate = path.resolve('./src/templates/Slicemaster.js');
  // 1. query all slicemasters
  const { data } = await graphql(`
    query {
      slicemasters: allSanityPerson {
        totalCount
        nodes {
          name
          id
          slug {
            current
          }
        }
      }
    }
  `);
  // 2. turn each slicemasters into their own page.
  data.slicemasters.nodes.forEach((slicemaster) =>
    actions.createPage({
      path: `slicemasters/${slicemaster.slug.current}`,
      component: slicemasterTemplate,
      context: {
        name: slicemaster.name,
        slug: slicemaster.slug.current,
      },
    })
  );
  // 3. find out how many pages there are based on how many
  // slicemasters are there, and how many per page.
  const pageSize = parseInt(process.env.GATSBY_PAGE_SIZE);
  const pageCount = Math.ceil(data.slicemasters.totalCount / pageSize);
  // console.log(
  //   `there are ${data.slicemasters.totalCount} total people. And we have ${pageCount} pages with ${pageSize} per page`
  // );
  // 4. loop from 1 to n, and create pages for them.
  Array.from({ length: pageCount }).forEach((_, i) => {
    // console.log(`creating page ${i}`);
    actions.createPage({
      path: `/slicemasters/${i + 1}`,
      component: path.resolve('./src/pages/slicemasters.js'),
      // this data is passed to the template when we create it
      context: {
        skip: i * pageSize,
        currentPage: i + 1,
        pageSize,
      },
    });
  });
}

export async function sourceNodes(params) {
  await fetchBeersAndTurnIntoNodes(params);
  // fetch a list of beers and source them into gatsby API
}

export async function createPages(params) {
  // Create pages dynamically
  await Promise.all([
    turnPizzasIntoPages(params),
    turnToppingsIntoPages(params),
    turnSlicemastersIntoPages(params),
  ]); // Promise.all enables concurrent execution of promises.
  // 1. Pizzas
  // await turnPizzasIntoPages(params);
  // 2. Toppings
  // await turnToppingsIntoPages(params);
  // 3. Slicemasters
}
