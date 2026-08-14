---
layout: page
title: Tools
description: >
  Open hardware, simulators and software tools built by Pranav Kedia for swarm
  robotics and autonomous sailing research.
hide_description: true
sitemap: true
permalink: /tools/
---

{% assign tools = site.data.tools %}

{% if tools.size > 0 %}
<ul class="entry-list">
  {% for tool in tools %}
    <li class="entry">
      <div class="entry__main">
        <h3 class="entry__title">
          {% if tool.url %}
            <a href="{{ tool.url }}">{{ tool.name }}</a>
          {% else %}
            {{ tool.name }}
          {% endif %}
        </h3>
        {% if tool.description %}
          <p class="entry__meta">{{ tool.description | strip_newlines }}</p>
        {% endif %}
      </div>
      {% if tool.kind %}
        <p class="entry__date">{{ tool.kind }}</p>
      {% endif %}
    </li>
  {% endfor %}
</ul>
{% else %}
<p>Nothing listed yet.</p>
{% endif %}
