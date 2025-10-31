let items = [];
items = [
    {
        "title": "Driving a manual car in 2025",
        "description": "My experience learning to drive a manual car",
        "date": "10 Sep 2025 AD",
        "content": [
            {
                "contentType": "text",
                "header": "Introduction",
                "content": "I am privileged enough to have access to an incredible car: a 2023 Honda Civic Si in the rare orange pearl color. Even though it only has 200hp, I absolutely adore the thing. It takes corners great and its tranmission feels great. However, I had one problem: it is a manual transmission car, and I had never driven a manual before. So, I set out to learn how to drive a manual car."

            },
            {
                "contentType": "text",
                "header": "Learning Process",
                "content" : "Prior to driving the Civic, I had attempted to drive a friend's Miata a few times, but perhaps only got it moving twice. This had given me a sour expectation of driving mine, but I was still eager to do so. Much to my dismay, however, the Civic was incredibly forgiving. I could easily get the car moving with just the clutch, not even giving it any gas. I don't even think I stalled it the first few days of learning in a vast parking lot. What I found to be best when learning was first finding where the clutch began to engage with the engine, and slowly getting the car moving with no gas at first. Once I had gotten that down, I began to add gas. I was proficient enough at my clutch control that I could get the car moving in second gear alone, with minimal gas (although this probably isn't advised!)."
            },
            {
                "contentType": "text",
                "header": "Switching Gears",
                "content": "See what I did there? Once I could consistently get the car moving, I began switching gears. Honda has mastered the tactile feel of the shifter, giving me a lot of leeway when shifting. Although, I did find that I had to be careful going from first to second, as the engine has pretty bad rev hang, meaning the RPMs would stay high for a while after letting off the gas. This made it tricky to shift into second without the car lurching forward. For some reason though, I never felt that at other gears. Overall, I found shifting to be pretty easy, and I was able to do it smoothly after a few days of practice."
            
            },

            {
                "contentType": "text",
                "header": "Modern manuals?",
                "content": "One thing I found interesting about driving a modern manual car is the presence of features like rev-matching and auto-blip. The Civic Si has both of these features, which help make downshifting smoother. Rev-matching automatically blips the throttle when downshifting, while auto-blip does the same thing but only when the car detects that you're going to downshift. These features were a bit controversial among manual enthusiasts when they first came out, but I found them to be quite helpful when learning. They took some of the guesswork out of downshifting, allowing me to focus more on my clutch control and shifting technique. While I think if I were given the keys to a 1976 Skoda 120L, I would have a much harder time driving it smoothly without these modern aids, but still be able to maybe get around. I think these features are great for making manual cars more accessible to a wider audience, and I appreciate that Honda included them in the Civic Si. Regarding current production cars, I think manuals are becoming increasingly rare, especially in the US market. However, I still believe there is a place for them among driving enthusiasts. They offer a level of engagement and control that simply cannot be matched by automatic transmissions. While I understand that manuals may not be as practical for everyday driving, manuals are becoming increasingly rare, but I do see a slight wane in their demand. I think as long as there are car enthusiasts who value the driving experience, there will always be a place for manuals in the automotive world."
            }
        ]
    },
    {
        "title": "Plans For Jumping Robot 2026 - 2026",
        "description": "My plans and initial drawings for a jumping robot",
        "date": "14 Oct 2025 AD",
        "content": [
            {
                "contentType": "image",
                "caption" : "Chassis CAD model",
                "source" : "https://github.com/grsszne/zaneg.net--assets/blob/main/static/imgs/jumper.png?raw=true",
            },
            {
                "contentType": "text",
                "content": "For the 2025- 2026 school year, I am building a jumping rover for NASA HUNCH. The main objectives for the rover are to repeatably jump >3ft, stream video, and be remotely controlled. The rover will be controlled by either an ESP32 or an NRF52840 microcontroller. The rover will be powered by a 3 or 4s LiPo battery. I have already drawn the linkage by which the rover will jump, requiring only one driven link for each of the two legs."
            },
            {
                "contentType": "text",
                "header" : "Overview",
                "content" : "Ambitously, the rover will be bipedal, with 2 indivually controllable legs. I plan for each of the legs to have 2 degrees of freedom: the main brushless motor that moves the linkage, and maybe a servo at the ''knee'' that acts as a calf to actuate the heel. The main motors will each be controlled by a 15 amp speed controller made for rc boats, as the typical ones for drones are not bidirectional, which is required for my jumping mechanism. There will be a singular 750mah 3S (11.1V) LiPo battery. The microcontroller will be an ESP32; however, this requires 3.3V, so I will make a voltage regulator PCB to step down the voltage from the battery to 3.3V for the MCU and other peripherals, e.g. camera, encoders. All strucutral components will be either 2mm or 1mm sheet metal due to tolerances & strength to weight. 5075 alloy was chosen due to its elasticity (the more common 6061 is more brittle and prone to cracking, not ideal for sudden impact of landing). Arterial, not highly load bearing components will be 3D printed pla. The main motors are 1750KV drone motors, which need a ~700:1 gear ratio for adequate speed and torque. The gears are made of laser cut delrin, as it is low friction and strong. The rover will have a camera module, like a seperate 5.8 ghz camera module from FPV drones, whose video stream can easily be accessed via a usb adapter which practically acts as a webcam, but instead receives video over 5.8 ghz.",
            },
            {
                "contentType": "image",
                "caption" : "Leg linkage (ratios). It is important that the center of mass is colinear with the path made by the end of the foot (Marker G in image), which is roughly straight, as to not induce excess torques when jumping.",
                "source" : "https://github.com/grsszne/zaneg.net--assets/blob/main/static/imgs/jumpinglinkage.png?raw=true"
            },
            {
                "contentType": "text",
                "header" : "Energy Storage",
                "content": "Each leg has 2 springs, one compression spring and one torsion spring. My greatest intent for either spring is that they dont impede on the extension of the leg when compressed passed their equilibrium point. The compression spring works pretty straightforwardly: when the leg is compressed, the spring compresses, storing energy. When the leg is extended, the spring extends, releasing energy. The torsion spring is a bit more comples. The input of the linkage is a gear, driven by the gear box. This input gear is comprised of three layers, 1 layer is a link of the leg linkages, and the other 2 are used to kind of sandwich the torsion spring in parallel between the gearbox and input link. When the spring is compressed past the neutral point, one end of the torsion spring pushes against the gold standoff, compressing the spring and storing energy prior to a jump. When the leg is extended the torsion spring presses against nothing, thus not impeding the extension of the leg. The torsion spring is primarily used to store energy for the initial part of the jump, while the compression spring is used to store energy for the latter part of the jump. This is because the torsion spring can be compressed more easily at small angles, while the compression spring is more effective at larger displacements."

            },
            {
                "contentType": "image",
                "caption" : "Torsion spring assembly. The torsion spring is sandwiched between the input link and the gearbox, with one end pressing against a standoff when compressed past neutral.",
                "source": "https://github.com/grsszne/zaneg.net--assets/blob/main/static/imgs/gearshown.png?raw=true"
            },
            {
                "contentType": "image",
                "caption" : "The middle layer kind of hugs one leg of the torsion spring, dragging it along and compressing it against the gold stand off when the leg is compressed.",
                "source": "https://github.com/grsszne/zaneg.net--assets/blob/main/static/imgs/gearhidden.png?raw=true"
            }
        ]
    },
    {
        "title": "Ejecting Rover 2024 - 2025",
        "description": "",
        "date": "20 May 2025 AD",
        "content": [
            {
                "contentType": "text",
                "header": "Overview",
                "content": "As a part of the 2024 - 2025 NASA HUNCH project, I had built an ejecting rover. The rover itself was to fit in a ~4'' cube and eject itself from a structure (a landed lunar module)."
            },
            {
                "contentType": "image",
                "caption" : "Final rover design cross section",
                "source" : "https://raw.githubusercontent.com/grsszne/zaneg.net--assets/refs/heads/main/static/Screenshot%202025-10-25%20at%2019.46.40.png"
            },
            {
                "contentType": "text",
                "header": "The Good",
                "content": "The best part of my design, to me, was its novelty, creativity, and features. A good 80% of the effort I had put in went towards the custom PCBs I made, of which there were 3: a main control board with motor drivers, power management, and sensors. Further, the design itself, too, I was quite fond of. For some reason, I priortize looks an irrational amount, almost so much so as the functionality. The rover was compact, and had a relatively simple design from the outside with 2 little arms that made it sort of crawl around, and 2 mirrored plated on the top and bottom which the rover rested on, with these plates being able to rotate and thus turn the rover, as the 2 arms' movements on either side were not independent of each other, i.e., the arms only were responsible for moving the rover forwards and backwards, while the plates were responsible for turning."

            },
            {
                "contentType": "image",
                "caption" : "Main PCB with MCU and motor drivers. I know it's ugly!",
                "source" : "https://raw.githubusercontent.com/grsszne/zaneg.net--assets/refs/heads/main/static/imgs/mainpcb.png"
            },
            {
                "contentType": "text",
                "header": "The Bad",
                "content": "As incredible as 3D printing is, I believe it was ultimately to the detriment of my project. In something this small, the tolerances of 3D printing really start to show. Many of my parts, especially the linkage parts, were either too tight or too loose, and I had to do a lot of sanding and filing to get them to fit properly. Further, the strength of 3D printed parts is often questionable, especially when subjected to repeated stress cycles, as would be the case with my ejecting rover. Many of my parts ended up cracking or breaking after a few landings, which was incredibly frustrating. The PCBs, although mostly functional, were not great. This was my first time challening myself with them, and it shows. The worst offender is the power PCB, which I made when I had not concept of how to design a voltage booster, figuring you can just connect an inductor and some caps around an IC all across a PCB and either side haphazardly. Needless to say, it did not work, and I had to power the rover with a battery pack connected directly to the main PCB. Mechanically, the rover had a lot of issues as well. The screws used to tighten the bearing in the leg linkage would loosen themselves over time and fall out."
            },
            {
                "contentType": "text",
                "header" : "The Ugly",

                "content":"I think what ultimately killed me was that in the end, the orver didnt even work! The motor driver I was using, the TB6612, had a logic voltage input of 3.3V, but I had supplied it the motor voltage fo 7.4V! This had pretty much rendered the rover useless, as now I had to redesign the entire main PCB, which I did not have time for. Further, even if the motor driver had worked, I had not tested the jumping linkage enough to know if it would even work. I doon't even want to hink about how my ejection mechanism worked... I had made a crude container for the rover to sit in, with dovetailed rails that slid off the parent object. An electromagnet on the parent would be supplied some 40V in hopes of giving the box, which had a large magnet at its end, the most tiny little twitch on the rail, not even enough to overcome static friction. The steel casing of the electromagnet was attracting the magnet on the box more than the electromagnet was repelling the magnet on the box. It was a mess."
            },
            {
                "contentType" : "text",
                "header" : "Conclusion",
                "content" : "When it had come to present my project, I had to admit defeat, at least from the standpoint of the competition. (Incoming cliche about failure leading to success). Although I was disappointed that my rover did not work as intended, I learned a lot from the experience. I learned about the importance of prototyping and testing, especially for mechanical systems. I also learned about the challenges of working with small-scale systems, and the importance of considering manufacturing tolerances and material properties. Overall, while my ejecting rover may not have been a success in terms of functionality, it was a valuable learning experience that will undoubtedly inform my future projects. This was by far the most challenging project I have ever undertaken, and I am proud of the effort and creativity that went into it. At least I made one of the 15 honorable mentions for Texas! https://www.hunchdesign.com/uploads/2/2/0/9/22093000/northern_and_southern_texas_honorable_mentions_a.pdf"
            },
            {
                "contentType" : "text",
                "header" : "Asides",
                "content" : "I was one of 4 chosen for an internship with NASA, but this did not go through because of NASA and Department of Education budget cuts. The Good the Bad and the Ugly is a great movie too (I don't use these headers just as clichés), but I prefer For a Few Dollars More. Hmm..."
            }



        ]
    },
    {
        "title": "Why we failed",
        "description": "Or why we didn't fail?",
        "date": "25 Oct 2025 AD",
        "content": [
            {
                "contentType": "text",
                "content": "All of our systems, including PCBs, linkages, and embedded code, worked perfectly. Well, not all the PCBs. The main PCB responsible for both the sensors, motor drivers, and microcontroller had a flaw wherein..."
            }
        ]
    }
];

//automatically create slugs:

items = items.map(item => {
    return {
        ...item,
        postId: item.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    }
});

export default items;