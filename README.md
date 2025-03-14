# Bridge Crossing

This is an application I made as part of an exercise to determine my level of proficiency with Javascript.

While I accomplished most of the tasks set forth in the exercise, the state of the application isn't quite where I would like it to be. Some of the things I feel it is lacking are:

- The Remove Person feature is bugged on the view end (although it does exactly what it's supposed to on the model end). It looks like it always removes the last person, but does in fact remove the correct person based on the original ID of the person. The names get shifted down, though, so if you have Louise in spot 0 with crossTime of 1, and tell it to remove ID 0, it will look like Louise is still there, but instead with a crossTime of the next person up. Therefore, the model and algorithm is removing it properly, but the interface is bugged. I know how to fix this, but it would take more time than I think I have.
- I wanted to add music, but I don't currently have sound on my work machine, so I couldn't test it. It seems like it would have been pretty easy, though.
- I wanted to add background sounds, like crickets chirping and owls hooting, to indicate it's night time. Same reason as the lack of music, although I also would have needed to search for some workable sound effects.
- The people are just dots, and everything but the bridge are just solid colors. I wanted to make the people actually look like people with randomly colored skin, hair, and clothes, but that idea got overwhelmed by everything else.
- I really wanted to add the torch visually, along with a massive black element to cover the main view with an opacity of around 50%. The torch would then create a feathered mask in the center of the element to provide a small area around the torch that appears to be illuminated. Optionally, I would then add a CSS animation to rapidly adjust the scale of the element to make it appear to be flickering. Unfortunately, I just ran out of time.

## Update Roadmap

✓ Fix model bugs (use unique ID instead of Person index, etc.)

✓ Convert all JavaScript to TypeScript

✓ Add tests for the model

☐ Add tests for the controller

☐ Convert single view into multiple React views

☐ Add tests for each view

☐ Improve visuals and UI

☐ Add visual options to modify people and model attributes

☐ Save changes to browser cache

☐ Record runs and download results in CSV

## Update Log

### 29 Jan, 2025

I've completed the foundation for the next upcoming changes. Converting to TypeScript was the most important change, and will make the rest much easier to fix and upgrade. The model tests were the most essential, although I will also be adding tests for the controller and views.

All of this is done to lay the foundation for the next stage, which is to convert the vanilla JavaScript front end to React. Additionally, I plan to change the current singular view into multiple views to better showcase the MVC design pattern.

The initial conversion to React shouldn't modify the existing UI at all. Once the conversion is done, however, I intend to dive into the UI and improve it in various areas.

One important note is that I didn't dive deep into making sure the algorithm itself is optimal. It appears to work using simple cases, but for more complex set ups I haven't confirmed that it always does it in the most efficient way. My focus currently is on modernizing the framework rather than improving the algorithm. Eventually I would like to introduce a system to figure out what the optimal algorithm is based on experimentation and comparing many different runs, perhaps as a very lightweight AI model. That will come at a much later point, however, if it comes at all. It is not the current priority.

### 14 Mar, 2025

I set aside this small project temporarily to study, but I'm back and looking to finish the roadmap before moving on to the next thing I have in mind.

I've nearly achieved 100% code coverage for the model tests, and I've started in on the tests for the controller. However, at this point I'm going to take a break on the tests to instead move forward on the React view conversion. Once I have the app working more or less as it did before, I will either finish the Controller tests, or I may move forward with the rest of the roadmap.

