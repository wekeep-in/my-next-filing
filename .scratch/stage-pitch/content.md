# My Next Filing — speaker script

The Pledge, the Turn and the Prestige shape the live 14-slide deck. The act labels and bracketed cues are presenter notes, not spoken copy. All product demonstrations use a fictional supported freelancer, not the agency from the origin story.

## The Pledge

[1. When is my next tax filing?]

When I was setting up my design agency, I wanted to spend my time doing the work. Finding clients. Designing things. Getting paid.

And somewhere in between, I needed to answer this:

When is my next tax filing?

It felt like a simple enough question. I hired a CA to help me with it, and got on with building the agency.

[Pause. Leave the question on screen.]

[2. Then the replies stopped.]

A few months later, my CA stopped responding.

Calls. Emails. WhatsApp. Nothing.

But the notices kept arriving.

I didn't understand what they meant. I didn't know which ones needed me to do something, or where to even begin.

So I did what most of us would do.

I Googled it.

## The Turn

[3. Terminology cloud]

Try searching for something like “Upwork freelancer tax filing.”

You find an explanation. But there's a term in it you don't understand. So you search for that term. That explanation sends you to another page.

Then you're watching a YouTube tutorial. Then asking ChatGPT about the part you still can't work out.

Every answer seems to come with another question.

[Let the audience take in the terminology cloud.]

[4. Portal screenshots]

And even when you understand the words, you still have to work out which instructions apply to your situation.

Where do I go? Does this apply to me? Is there something else I need to do first?

I started with one question. Now I had a collection of tabs, videos and notices—and I was still trying to piece the answer together.

[5. From notes to a tool.]

So I started keeping notes in Notion.

Those notes became a small Streamlit app with a calendar. Later, I added tools to parse statements and calculate taxes.

That was my internal setup. Something I built because I kept running into the same problem.

Over time, it gave me a clearer idea of what I wanted to build for solo freelancers:

A tool that shows what they might owe, what's due next, and why it applies.

[6. When is my next tax filing?]

A way to come back to that first question:

When is my next tax filing?

[7. My Next Filing]

That's where My Next Filing came from.

[Let the product name land before starting the demo.]

Let me show you how it works. I've filled in a fictional freelancer's answers so we can follow the whole journey.

[8. Demo: the person behind the income]

First, it checks whether your situation is supported.

Who you work for. How you earn. Which other income or circumstances need to be taken into account.

Those details matter. A small difference can change which rules apply.

If the situation falls outside what the tool supports, it says so early. I wanted people to find that out before spending time entering all their numbers.

[Follow Fit for this app, Income and profit, Clients and payments, and Taxes and GST in order. Let each section settle before explaining it. Pause playback when needed.]

[Income and profit]

Next are income and profit. This example includes freelance income, salary, interest and dividends, rental income, and Indian equity gains.

Each has its own section, so I can check the amounts and the conditions that apply to it.

[Clients and payments]

This freelancer works with clients in India and overseas, both directly and through a platform.

The follow-up questions help establish how that work and those payments fit within what the app supports.

[Taxes and GST]

Then I check tax already paid, the income-tax filing conditions, and the GST situation.

All of that forms the picture the plan will use.

[9. Demo: from answers to a plan]

Before calculating, I can review the answers together and check that they reflect my situation.

[Follow the review. Click Calculate my plan, then hold on the result.]

Here is the plan.

The next supported action. Its date. The estimated amount left to pay.

I can open the explanation, inspect the official sources, and see how the estimate was calculated.

The agenda brings the other supported actions together. If something needs further review, that appears too.

[Hold on the plan long enough for the audience to inspect it.]

[10. Demo: come back and see what remains]

I can also choose to save the plan in this browser.

[Open the save notice. Let it remain visible before confirming.]

Later, after making a payment on the official portal, I come back to my saved workspace.

I update the amount paid and recalculate. Then I record that I've completed the action.

That's my own record; the app cannot verify government acceptance. I still file and pay outside the app.

[Follow the update, the new balance, the completion action and the updated agenda. Pause on each result.]

Now I can see what remains, without putting the whole picture together again.

## The Prestige

[11. And none of those answers were sent to us.]

You've just seen the whole journey.

The answers. The estimate. The explanation. The saved plan and the progress when I return.

And none of those answers or financial details were sent to us.

[Pause. Let the audience connect this to everything they just watched.]

[12. No financial data uploads. No third-party APIs. No web analytics.]

The calculations run right here, in the browser. The rules and source references are bundled with the app. There is no third-party API doing the calculation or receiving your answers.

There's no account to create, and no government portal integration.

I went a step further: there are no web analytics, session recordings or remote error trackers either.

If you choose to save, your answers and completion records stay in this browser's saved workspace. They aren't uploaded to us.

That comes with limits: there's no cross-device sync, clearing the browser data can erase it, and someone using the same browser profile may be able to access it.

[Presenter note: the hosting provider handles ordinary website request metadata. The claim is that the app does not upload questionnaire answers or financial details; do not describe hosting as collecting no data whatsoever or browser storage as guaranteed protection.]

I wanted to make it easier to understand your taxes without asking you to hand over your financial life.

[Pause.]

[13. Built with Codex]

And I built it with Codex.

The interesting part was learning which decisions I still needed to make myself.

What should the tool support? When should it stop and ask someone to get advice? How could the whole thing work without sending your answers anywhere?

Those decisions shaped the product you've just seen.

[Play the illustrative terminal animation. It represents the build process; it is not a captured session or certification.]

[14. Built for freelancers. By a freelancer.]

I wanted something I could come back to between doing the work.

See what remains. Know where to pick up.

Then get back to the thing I was trying to do in the first place.

That's why I built My Next Filing.

[Hold this slide. End here.]
