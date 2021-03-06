var Option, OrderReply, ReplyItem, libxmljs, objectDifference, objectInclude, objectIntersection, util, _;

libxmljs = require("libxmljs");

util = require('util');

Option = require('./option');

_ = require('underscore');

OrderReply = (function() {

  function OrderReply(body, cart_products) {
    var doc;
    this.body = body;
    this.cart_products = cart_products;
    if (!(typeof this.body === 'undefined' || !(this.body != null))) {
      doc = libxmljs.parseXmlString(this.body);
      if ((doc.get('//OrderReply') != null) && !_.isUndefined(doc.get('//OrderReply'))) {
        this.reply_id = doc.get('//OrderReply').attr('orderreplyid').value();
        this.status = doc.get('//Status').text();
        this.status_text = doc.get('//StatusText').text();
        if (doc.get('//StoreOrderID') != null) {
          this.order_id = doc.get('//StoreOrderID').text();
        }
        this.store = doc.get('//StoreID').text();
        this.service_method = doc.get('//ServiceMethod').text();
        this.can_place = doc.get('//CanPlaceOrder').text();
        this.wait_time = doc.get('//EstimatedWaitTime').text();
        this.sumary = doc.get('//OrderText').text();
        this.order_items = _.map(doc.find('//OrderItem'), function(order_item) {
          return new ReplyItem(order_item);
        });
        this.sumary = doc.get('//OrderText').text();
        this.netamount = doc.get('//NetAmount').text();
        this.taxamount = doc.get('//TaxAmount').text();
        this.tax1amount = doc.get('//Tax1Amount').text();
        this.tax2amount = doc.get('//Tax2Amount').text();
        this.payment_amount = doc.get('//PaymentAmount').text();
      }
    }
  }

  OrderReply.prototype.products = function() {
    var build_result, cart_product, order_item, quantity, reply_quantity, results, _i, _j, _len, _len1, _ref, _ref1;
    results = [];
    _ref = this.order_items;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      order_item = _ref[_i];
      _ref1 = this.cart_products;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        cart_product = _ref1[_j];
        order_item.code = order_item.code.split('/')[0];
        order_item.binded_product = order_item.code.split('/')[1] || null;
        if ((cart_product.quantity != null) && !_.isUndefined(cart_product.quantity)) {
          quantity = cart_product.quantity;
        } else {
          quantity = null;
        }
        if ((order_item.quantity != null) && !_.isUndefined(cart_product.quantity)) {
          reply_quantity = Number(order_item.quantity);
        } else {
          reply_quantity = null;
        }
        if (order_item.code === cart_product.product.productcode && reply_quantity === quantity && _.isEmpty(objectDifference(Option.pulseCollection(cart_product.options), order_item.options))) {
          build_result = {
            cart_product_id: cart_product.id,
            product_id: cart_product.product.id,
            priced_at: order_item.priced_at
          };
          if (!objectInclude(results, build_result)) {
            results.push(build_result);
          }
        }
      }
    }
    return results;
  };

  return OrderReply;

})();

objectIntersection = function(array, rest) {
  var i1, i2, result, _i, _j, _len, _len1;
  result = [];
  for (_i = 0, _len = array.length; _i < _len; _i++) {
    i1 = array[_i];
    for (_j = 0, _len1 = rest.length; _j < _len1; _j++) {
      i2 = rest[_j];
      if (_.isEqual(i1, i2)) {
        result.push(i1);
      }
    }
  }
  return _.uniq(result);
};

objectInclude = function(array, target) {
  var found;
  found = false;
  found = _.find(array, function(value) {
    return _.isEqual(value, target);
  });
  return found != null;
};

objectDifference = function(array, rest) {
  var i1, result, _i, _len;
  result = [];
  for (_i = 0, _len = array.length; _i < _len; _i++) {
    i1 = array[_i];
    if (!objectInclude(rest, i1)) {
      result.push(i1);
    }
  }
  return _.uniq(result);
};

ReplyItem = (function() {

  function ReplyItem(order_item) {
    this.code = order_item.childNodes()[0].text();
    this.quantity = order_item.childNodes()[2].text();
    this.priced_at = order_item.childNodes()[3].text();
    if (order_item.childNodes()[4] != null) {
      this.options = _.map(order_item.childNodes()[4].childNodes(), function(item_modifier) {
        var code, part, quantity, _ref, _ref1, _ref2;
        quantity = (_ref = item_modifier.childNodes()[1]) != null ? _ref.text() : void 0;
        part = (_ref1 = item_modifier.childNodes()[2]) != null ? _ref1.text() : void 0;
        code = (_ref2 = item_modifier.attr('code')) != null ? _ref2.value() : void 0;
        return {
          quantity: quantity,
          code: code,
          part: part
        };
      });
    }
  }

  return ReplyItem;

})();

module.exports = OrderReply;
