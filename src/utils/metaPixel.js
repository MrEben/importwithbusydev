export const pageView = () => {
  if (window.fbq) {
    window.fbq("track", "PageView");
  }
};

export const viewContent = (product) => {
  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: product.name,
      value: product.price,
      currency: "GHS",
    });
  }
};

export const initiateCheckout = (product) => {
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_name: product.name,
      value: product.price,
      currency: "GHS",
    });
  }
};

export const purchase = (product = {}) => {
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      content_name: product.name,
      value: product.price,
      currency: "GHS",
    });
  }
};

export const lead = (product = {}) => {
  if (window.fbq) {
    window.fbq("track", "Lead", {
      content_name: product.name,
      value: product.price,
      currency: "GHS",
    });
  }
};