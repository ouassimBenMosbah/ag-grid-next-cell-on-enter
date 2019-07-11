import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import 'dhtmlx-gantt/dhtmlxgantt.js';
import 'dhtmlx-gantt/ext/dhtmlxgantt_auto_scheduling.js';
import 'dhtmlx-gantt/ext/dhtmlxgantt_keyboard_navigation.js';
import 'dhtmlx-gantt/ext/dhtmlxgantt_marker.js';
import 'dhtmlx-gantt/ext/dhtmlxgantt_smart_rendering.js';

interface GanttConfigOptions {
  auto_scheduling_compatibility: boolean;
}

@Component({
  selector: 'app-root',
  template: '<button (click)="schedule()">schedule</button><div id="gantt_here" style="width:100%; height:100%;"></div>'
})
export class AppComponent implements OnInit {
  @ViewChild('ganttHere') ganttHere: ElementRef;

  ngOnInit() {
    gantt.config = {
      ...gantt.config,
      auto_scheduling: true,
      auto_scheduling_compatibility: true,
      auto_scheduling_initial: true,
      auto_scheduling_strict: true,
      drag_move: false,
      drag_progress: false,
      drag_resize: false,
      fit_tasks: true,
      keyboard_navigation: true,
      keyboard_navigation_cells: false,
      link_arrow_size: 4,
      link_line_width: 1,
      open_tree_initially: true,
      order_branch: 'marker',
      order_branch_free: true,
      scroll_on_click: false,
      show_task_cells: false,
      smart_rendering: true,
      smart_scales: true,
      static_background: true,
      show_errors: false
    };

    gantt.config.columns = [
      { name: 'text', label: 'Task name', width: '*', tree: true, editor: { type: 'text', map_to: 'text' } },
      { name: 'start_date', label: 'Start time', editor: { type: 'date', map_to: 'start_date' } },
      { name: 'duration', label: 'Duration' }
    ];

    const keyNav = gantt.ext.keyboardNavigation;
    const mapping = {
      init: inlineEditors => {
        gantt.attachEvent('onTaskDblClick', (id, e) => {
          const cell = inlineEditors.locateCell(e.target);
          if (cell && inlineEditors.getEditorConfig(cell.columnName)) {
            inlineEditors.startEdit(cell.id, cell.columnName);
            return false;
          }
          return true;
        });

        keyNav.attachEvent('onKeyDown', (id, e) => {
          console.log(e);
        });

        gantt.attachEvent('onEmptyClick', () => {
          inlineEditors.hide();
          return true;
        });
      },

      onShow: (inlineEditors, node) => {
        node.onkeydown = e => {
          // tslint:disable-next-line: deprecation
          e = e || window.event;
          if (e.defaultPrevented) {
            return;
          }

          const keyboard = gantt.constants.KEY_CODES;

          let shouldPrevent = true;
          switch (e.keyCode) {
            case gantt.keys.edit_save:
              const cell = inlineEditors.locateCell(e.target);
              inlineEditors.startEdit(gantt.getNext(cell.id), cell.columnName);
              break;
            case gantt.keys.edit_cancel:
              inlineEditors.hide();
              break;
            case keyboard.TAB:
              if (e.shiftKey) {
                inlineEditors.editPrevCell(true);
              } else {
                inlineEditors.editNextCell(true);
              }
              break;
            default:
              shouldPrevent = false;
              break;
          }

          if (shouldPrevent) {
            e.preventDefault();
          }
        };
      },

      onHide: (inlineEditors, node) => {}
    };

    gantt.ext.inlineEditors.setMapping(mapping);

    gantt.init('gantt_here');
    gantt.parse({
      data: [
        { id: 1, text: 'Project #1', start_date: '01-03-2019', duration: 3 },
        { id: 2, text: 'Project #2', start_date: '05-03-2019', duration: 2 },
        { id: 3, text: 'Task #1', start_date: '08-03-2019', duration: 2 }
      ],
      links: [{ id: 1, source: 1, target: 2, type: '0' }, { id: 2, source: 2, target: 3, type: '0' }]
    });
  }

  public schedule() {
    gantt.autoSchedule();
  }
}
