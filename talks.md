---
layout: page
title: Talks
description: >
  Invited talks and seminars given by Pranav Kedia on swarm robotics,
  autonomous sailing vessels and open hardware.
hide_description: true
sitemap: true
permalink: /talks/
---

{% assign talks = site.data.talks | sort: "date" | reverse %}

{% if talks.size > 0 %}
<ul class="entry-list">
  {% for talk in talks %}
    <li class="entry">
      <div class="entry__main">
        <h3 class="entry__title">
          {% if talk.url %}
            <a href="{{ talk.url }}">{{ talk.title }}</a>
          {% else %}
            {{ talk.title }}
          {% endif %}
        </h3>
        <p class="entry__meta">
          {%- if talk.kind %}<span class="entry__tag">{{ talk.kind }}</span>{% endif -%}
          {{ talk.venue }}{% if talk.place %} &middot; {{ talk.place }}{% endif %}
        </p>
      </div>
      {% comment %} Only month and year are shown; see _data/talks.yml. {% endcomment %}
      <p class="entry__date">
        <time datetime="{{ talk.date | date: '%Y-%m' }}">{{ talk.date | date: "%b '%y" }}</time>
      </p>
    </li>
  {% endfor %}
</ul>
{% else %}
<p>Nothing listed yet.</p>
{% endif %}
