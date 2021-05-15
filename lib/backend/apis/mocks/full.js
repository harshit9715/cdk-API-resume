const basics = require('./basics');
const awards = require('./awards');
const education = require('./education');
const interests = require('./interests');
const references = require('./references');
const skills = require('./skills');
const work = require('./work');

module.exports = {
  "basics": basics,
  "work": work,
  "education": education,
  "volunteer": [
    {
      "organization": "Atmecs",
      "position": "Speaker",
      "website": "Atmecs.com",
      "startDate": "2020-03-07",
      "endDate": "N/A",
      "summary": "Tech Talk is an Atmecs initiative in which people working on new exciting technologies come forward and describe about it, their experience and how it is utilized.",
      "highlights": [
        "I Gave a talk about Stripe payments when they had just one product, and how easy it was to implement and use it."
      ]
    }
  ],
  "awards": awards,
  "skills": skills,
  "languages": [
    {
      "language": "English",
      "fluency": "Native speaker"
    }
  ],
  "interests": interests,
  "Recommendations": references
}