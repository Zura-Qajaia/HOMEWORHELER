const pug = require("pug");
const path = require("path");

const pugTemplate = async (req, res) => {
  try {
    const templatePath = path.join("views", "base.pug");

    const html = pug.renderFile(templatePath, {
      pageTitle: "Welcome to My Website",
      message: "This is a Pug template example",
    });

    res.send(html);
  } catch (error) {
    console.error("Error rendering Pug template", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = pugTemplate;
