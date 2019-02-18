const request = require("request");

const ORDER_CART_REGEX_PATTERN = /view\.order_cart\s*\=\s*JSON\.parse\((.*)\);\n/gm;

// Create our currency formatter.
var formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
  // the default value for minimumFractionDigits depends on the currency
  // and is usually already 2
});

formatter.format(2500); /* $2,500.00 */

request("https://www.doordash.com/orders/track/umuJNq9w1y4F3cD/", function(
  error,
  response,
  body
) {
  // Parse response body to get cart order details in a JSON object.
  var matches = ORDER_CART_REGEX_PATTERN.exec(body);
  var cart_order_text = matches[1];
  cart_order_json = JSON.parse(JSON.parse(cart_order_text));

  // Parse and display high-level order cost details.
  order_costs = {
    tip: getTip(cart_order_json),
    tax: getTax(cart_order_json),
    service_fee: getServiceFee(cart_order_json),
    delivery_fee: getDeliveryFee(cart_order_json),
    subtotal: getSubtotal(cart_order_json),
    total: getTotal(cart_order_json)
  };
  printObject(order_costs);

  // Calculate and display order costs per person.
  orders = getOrders(cart_order_json);
  for (i in orders) {
    order = orders[i];
    subtotal = calculateConsumerSubtotal(order);
    order_info = {
      name: getName(order.consumer),
      consumer_subtotal: formatter.format(subtotal / 100),
      consumer_total: formatter.format(
        calculateConsumerTotal(subtotal, order_costs) / 100
      )
    };
    printObject(order_info);
  }
});

function getTip(order) {
  return cart_order_json.tip_amount_monetary_fields.unit_amount;
}
function getTax(order) {
  return cart_order_json.tax_amount_monetary_fields.unit_amount;
}
function getServiceFee(order) {
  return cart_order_json.applied_service_fee;
}
function getDeliveryFee(order) {
  return cart_order_json.delivery_fee_details.final_fee.unit_amount;
}
function getSubtotal(order) {
  return cart_order_json.subtotal;
}
function getTotal(order) {
  return cart_order_json.total_charged;
}
function getOrders(order) {
  return cart_order_json.orders;
}
function getName(consumer) {
  return consumer.first_name + " " + consumer.last_name;
}

function calculateConsumerSubtotal(order) {
  order_items = order.order_items;
  subtotal = 0;
  for (i in order_items) {
    item = order_items[i];
    subtotal += item.single_price_monetary_fields.unit_amount;
  }
  return subtotal;
}

function calculateConsumerTotal(consumer_subtotal, order_costs) {
  ratio = consumer_subtotal / order_costs.subtotal;
  shared_costs =
    order_costs.tip +
    order_costs.tax +
    order_costs.service_fee +
    order_costs.delivery_fee;
  return ratio * shared_costs + consumer_subtotal;
}

function printObject(obj) {
  Object.keys(obj).forEach(key => {
    console.log(key + ": " + obj[key]);
  });
}
