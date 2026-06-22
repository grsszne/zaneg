---
title: "GPT-0.1875: Training a Language Model Before Modern Physics"
description: "A GPT-2 Class, 112M param model trained only on corpus before 1 January, 1876."
date: "June 2026 AD"
order: 2
---

## Introduction

Take the following response:

> QUESTION: What is meant by gravitation? ANSWER:

...

> QUESTION: What is meant by gravitation in natural philosophy?
> ANSWER: "That man who hath the power of living, is
> all, but a soul, can bestow the soul."
> 
> 1. They are the law of the law of God and the law of God, to
> the law of God as a man (p. 40) by this law, according to
> the laws of nature, and to that of the law.
> 
> 2. They make the law of God, that is the law of God, (p. 31:5,

This does not exactly follow the teachings of Newton. This was an early response of GPT-0.1875, at only about 28 million parameters.

GPT-0.1875 is a transformer I am creating whose training data consists exclusively of English texts published before 1876. Textbooks, newspapers, theological texts evidently, and more. My goal was to build a model whose knowledge genuinely ended before 1876. Not an instruction set at the beginning of a prompt, but a model who has no knowledge of airplanes, cars, computers, the internet, relativity, quantum mechanics. 

## Why 1875

1875 is an interesting year for this idea. Classical mechanics were already well established, approaching 200 years since Newton's Principia. Similarly, thermodynamics had been well understood -- so, too, did Maxwell begin to transform our understandings of electricity, magnetism, and light. Being a physicist in 1875, you may have thought that we were on the precipice of forming a complete description of nature and its patterns. The motion of bodies belonged to simple models given by mechanics. Heat belonged to thermodynamics. Light, electricity, and magnetism belonged to electromagnetic theory. The few remaining mysteries seemed like gaps to be filled rather than signal that our understanding was thoroughly incomplete. 

They were not only "gaps".

Within the following decades, the electron, radioactivity, quantum theory, special relativity and more would overturn foundational understandings of all of physics. Classical physics had reached one of its greatest triumphs just before discovering the limits of its own framework.

This tension is exactly what makes 1875 such an interesting cutoff. GPT-0.1875 posses enough physics understanding to produce recognizably mature, scientific explanations, but not enough to understand where Newtonian mechanics will fail. It can discuss gravitation, heat, light, electricity, and planetary motion while remaining entirely unaware of the revolutions waiting just beyond its training data. The result is not intended to imitate a modern chatbot but in Victorian prose, but to build a truly temporally bounded model whose understanding, explanations, associations, and mistakes are indicative of the world it lives in.

## Building the Corpus

The first challenge was not the transformer itself, but rather, deciding what the model was allowed to be trained upon. Every document had to satisfy a few strict rules. For instance, the most obvious being a publication date cutoff. But there is nuance to this -- e.g., if a work is translated and subsequently published in English, it does not matter when the original language text was published, but rather, when the translation published. This is done namely to ensure that language and syntax unqiue to the period of the date of the translation's publication does not effect training -- whether that be in the contents itself, or, say, asides and introductions unique to said translation. 



At a quick glance, our first curated data set looked reasonably healthy and
broad. Weighted by token count, literature made up about 45%, history and
biography about 20, and the remainder included various publications in science,
medicine, law, newspapers, and religous texts. Religous texts accounted for
only about 5% of the entire set. 

## First Outputs

Here's what some preliminary prompts returned:

The result from the first smoke test didn't seem particularly alarming, just
expected outputs beginning to pick up on common phrases and words, [albeit](albeit)
incoherently:

>When the dog ran quickly down the street

...

><*>When the dog ran quickly down the street,</*> mate to his bed. life the dist, as the dist to bleAnd I doll. jABat to the sated to achedun on thefor unal and all this s " of the fatIt to the a, back, whoity a.. part, and forro haveone sad, fent S thehereun is not aff, the Wh, and the sde from all soitionet bleNogan, and in the as on I bh

This was only at 1.34M params, so nothing was too worrying; as mentioned, there
are signs of English morphology, attempts at grammar, and varying structure in
clauses (if you can call them that). 

Once we graduated to a small 28 million param test, returned was a much more
lexically sound albeit still incoherent response to the same prompt as above:

><*> When the dog ran quickly down the street,</*> And the horse was with him, in the middle of the avenue, With the back with the face and hand. THE COTEN. No sooner was she so well known than the old woman, And had she ever seen her to be so well known, When she heard the other night there was a sight Of daylight, and the moonlight, and the breeze Bet the stars that stood upon the sea. CHAPTER II.

Note the beginnings of continuity: the horse and the dog, middle of the avenue.
Of course, it quickly falls apart afterwards, but in contrast to the smoke
output, it is much more sound lexically. "CHAPTER II" is also an intersting
pick up from the literature in the training data.

But it would get worse before it got better: 

><*>QUESTION: What is meant by gravitation in natural philosophy?
>ANSWER:</*> "That man who hath the power of living, is
>all, but a soul, can bestow the soul."
>
>1. They are the law of the law of God and the law of God, to
>the law of God as a man (p. 40) by this law, according to
>the laws of nature, and to that of the law.
>
>2. They make the law of God, that is the law of God, (p. 31:5,

or 

><*>QUESTION: What is meant by gravitation? 
>ANSWER:</*> xtly; for, in all ages, where it is.
>KENTLE: Now, let us have thought, that God was not.
>KENTLE: But by the law of eternal redemption, which is
>in the law of Christ, I would have reason to believe, and
>shall find, that a sinner himself, or his disciples, who
>had not, who had not done, but had been, in the law, had
>served, he gave, as

And many more.

Whenever I asked the 28M output about electricity, gravity, light, it did not respond
with attraction, forces, Newton, Maxwell, or planetary motion. It answered with
God, souls, redemption, sin, disciples and the law of Christ. The model was not
only producing seemingly inexplicable results, but had translated questions of
physics into a theological catechism. Perhaps if trained on data predating the
Scientific Revolution some 300 years prior, these results could be
intelligible, but not in data before 1875, skewing left in date.

At first, this looked like a data-mixture problem in the obvious sense: perhaps I had accidentally trained mostly on religious material. But the broad genre counts showed that this was not true.

The more useful answer appeared only after counting concepts rather than categories.

| Concept              | Occurrences per 1M training tokens |
|----------------------|-----------------------------------:|
| Religious vocabulary |                              1,557 |
| “Newton”             |                                 32 |
| Astronomy cluster    |                                 29 |
| “Gravity”            |                                 24 |
| “Gravitation”        |                                1.9 |

This explained the model's behaviour much better than the inital genre chart.
Even though religous texts only accounted for 5% of the training data, religious
vocabulary appeared hundreds of thousands of times in highly repetitive, 
formulaic contexts. By contrast, “gravitation” appeared only a few hundred 
times, clustered in a small number of documents.

The model had not learned theology because the corpus was mostly theological. It had learned theology because, at small scale and under uncertainty, theological prose was one of the strongest and most self-similar patterns available to it.

More importantly, a pipeline bug affected smaller training stages (<100M P)
such that the first documents that passed the date filter in the catalogue
order. As a result, this meant that the 28M model saw effectively no physics,
math, or chemistry, even though many such sources were present in the
catalogue. Newton, Faraday, Maxwell, mechanics textbooks, and natural-philosophy works were present in principle, but many had high Gutenberg identifiers or appeared later in the data. The prototype simply never reached them. The failure was not that the model failed to learn from and interpret scientific works, but rather, that it hadn't seen any. 


