import React from 'react';
import Typography from '@material-ui/core/Typography';
import './About.css'

export default function About(props){
  return (
    <div className="About">
      <Typography variant="h4" className="h-1">
        Welcome to Mind Your Time
      </Typography>
      <p className="summary">
        Mind Your Time is a platform that aims to tackle a complex issue in a simplistic way
      </p>
      <p>
        Do you ever have trouble realistically planning out your day and then actually executing the plan?
        <br/>
        Mind Your Time is here to help.
      </p><p>
        The idea here is simple. Plan your day and then check if you're still on schedule.
        Write down when you're gonna do what and how long it's gonna take.
        Then periodically check if you're making the progress you should be making.
      </p><p>
        Like I said, the idea is simple but if you truly follow it, I promise your productivity will skyrocket.
        Starting right now.
      </p><p>
        It seems easy but if you've ever really tried doing it, you probably know it isn't.
        There are a ton of distractions. All the time. That is why we're introducing buffer times.
      </p>
      <div id="#bufferTimes">
        <Typography variant="h5" className="h-2">
          Buffer Times
        </Typography>
        <p className="summary">
          Buffer times are essential to making a realistic plan
        </p><p>
          You may have noticed that whenever you set out to do something, something else always comes up and requires your full attention.
          Like your cat walking over your keyboard. Or your coffee mug spilling.
          Or a billion other things that you simply cannot foresee.
          By the time you come back, your entire day's plan is thrown into disarray.
        </p><p>
          In order to be truly productive, you need to expect the unexpected.
          We take care of that for you.
        </p><p>
          Buffer times are the solution. They are short breaks that we automatically insert after each planned project.
          Their length is proportional to the length of the previous project - about 20% of the project's length by default.
          (Note that this can be changed in the settings)
          These little breaks in your schedule aren't primarily meant as breaks though.
          Instead, their job is to compansate for the distractions that happen while you're working on the previous project.
          Ideally when you actually execute your plan, these little breaks should disappear.
          However, if they don't feel free to rest for a little while - whatever works for you.
        </p><p>
          Of course if you feel like you need more breaks in your schedule, you can insert them in using our breaks editor.
          You could also increase the buffer time percentage in the settings
          but note that this comes at a price - a slight but measurable decrease in productivity.
          On the other hand, if you want to aim for even higher productivity, you can decrease the percentage
          but then you run the risk of your plan being too ideallistic and falling apart.
        </p><p>
          At the end of the day, your buffer times need to be balanced and that balance can only be accomplished by trial and error.
          So feel free to experiment with the percentage if you feel it can make the app work better for you.
        </p>
      </div>
      <div id="#aboutMe">
        <Typography variant="h5" className="h-2">
          About me
        </Typography>
        <p>
          I've experimented with a lot of different productivity/time-management systems over the years.
          At the end I developed a fairly simple system - writing down what I want to do today and when exactly I wanna do it.
          Sounds simple, I know, but it truly improved my productivity by a lot.
          The problem was that I couldn't find an app to use for this so I just had write it down on my whiteboard.
          (Yes, I actually have a whiteboard in my bedroom. Go ahead, judge me.)
        </p><p>
          This was pretty annoying so of course: I'm the kind of guy that needs everything on a screen so I didn't do it every day.
          And so a while later, I decided to create Mind Your Time.
          At first, it was just as a way off to show my skills to employers and organize my own time,
          only later did I realize that it could actually be really useful to other people as well.
        </p><p>
          I really hope you find this app useful and that it helps you with whatever you set out to do.
          If you find any problems, get an idea for a new feature you'd like to see or just want to send me anything at all, here's my contact info:
        </p>
        <div id="#contact">
          <Typography variant="h6">
            Contact
          </Typography>
          <a href="https://goo.gl/forms/jdesExEMegbkLPjp2" target="_blank" rel="noopener noreferrer">Feedback form</a> (you can submit feedback here or via email, whichever you prefer)
          <br/>
          Email: <a href="mailto:michaelfarnik@gmail.com">michaelfarnik@gmail.com</a>
          <br/>
          GitHub: <a href="https://github.com/michaloslav">Michael Farník</a>
        </div>
      </div>
    </div>
  )
}
