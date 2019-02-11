# Bridge Crossing

This is an application I made as part of an exercise to determine my level of proficiency with Javascript.

While I accomplished most of the tasks set forth in the exercise, the state of the application isn't quite where I would like it to be. Some of the things I feel it is lacking are:

- The Remove Person feature is bugged on the view end (although it does exactly what it's supposed to on the model end). It looks like it always removes the last person, but does in fact remove the correct person based on the original ID of the person. The names get shifted down, though, so if you have Louise in spot 0 with crossTime of 1, and tell it to remove ID 0, it will look like Louise is still there, but instead with a crossTime of the next person up. Therefore, the model and algorithm is removing it properly, but the interface is bugged. I know how to fix this, but it would take more time than I think I have.
- I wanted to add music, but I don't currently have sound on my work machine, so I couldn't test it. It seems like it would have been pretty easy, though.
- I wanted to add background sounds, like crickets chirping and owls hooting, to indicate it's night time. Same reason as the lack of music, although I also would have needed to search for some workable sound effects.
- The people are just dots, and everything but the bridge are just solid colors. I wanted to make the people actually look like people with randomly colored skin, hair, and clothes, but that idea got overwhelmed by everything else.
- I really wanted to add the torch visually, along with a massive black element to cover the main view with an opacity of around 50%. The torch would then create a feathered mask in the center of the element to provide a small area around the torch that appears to be illuminated. Optionally, I would then add a CSS animation to rapidly adjust the scale of the element to make it appear to be flickering. Unfortunately, I just ran out of time.

